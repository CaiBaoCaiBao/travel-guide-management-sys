# 中文请求头支持

## 问题描述
`X-User-Nickname` 请求头需要支持中文昵称，但 HTTP 请求头默认不支持非 ASCII 字符（如中文）。

## 解决方案
采用 Base64 编码/解码的方式处理中文请求头，在 JWT token 生成时进行编码，在后端拦截器中解码。

### 1. JWT Token 生成时编码
在 `parent/common/src/main/java/common/utils/JwtUtil.java` 中：

1. 添加 `encodeChinese` 方法，对包含中文的字符串进行 Base64 编码
2. 在 `setAccessClaims` 方法中，对 `userName` 和 `nickName` 进行编码

```java
/**
 * 对包含中文的字符串进行 Base64 编码
 */
private String encodeChinese(String value) {
    if (value == null || value.isEmpty()) {
        return value;
    }
    // 检查是否包含中文字符
    if (value.matches(".*[\\u4e00-\\u9fa5].*")) {
        return Base64.getEncoder().encodeToString(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
    return value;
}
```

### 2. 后端拦截器解码
在 `parent/common/src/main/java/common/interceptor/UserContextInterceptor.java` 中：

1. 添加 `decodeHeader` 方法，对请求头进行 Base64 解码
2. 在设置用户信息时，对 `userName` 和 `nickName` 进行解码

```java
/**
 * 解码请求头（处理中文等非 ASCII 字符）
 * 使用 Base64 解码
 */
private String decodeHeader(String value) {
    if (value == null || value.isEmpty()) {
        return value;
    }
    try {
        // 尝试 Base64 解码
        byte[] decodedBytes = java.util.Base64.getDecoder().decode(value);
        return new String(decodedBytes, "UTF-8");
    } catch (Exception e) {
        // 如果解码失败，返回原始值
        log.debug("解码请求头失败: {}, 使用原始值", value);
        return value;
    }
}
```

### 3. 字符编码配置
在 `parent/common/src/main/resources/application.yml` 中添加 UTF-8 编码配置：

```yaml
spring:
  servlet:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
      force-request: true
      force-response: true

server:
  servlet:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
```

在 `parent/common/src/main/java/common/config/WebConfig.java` 中添加字符编码过滤器：

```java
@Bean
public FilterRegistrationBean<CharacterEncodingFilter> characterEncodingFilter() {
    FilterRegistrationBean<CharacterEncodingFilter> registrationBean = new FilterRegistrationBean<>();
    CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
    characterEncodingFilter.setEncoding("UTF-8");
    characterEncodingFilter.setForceEncoding(true);
    characterEncodingFilter.setForceRequestEncoding(true);
    characterEncodingFilter.setForceResponseEncoding(true);
    registrationBean.setFilter(characterEncodingFilter);
    registrationBean.addUrlPatterns("/*");
    registrationBean.setOrder(1);
    return registrationBean;
}
```

## 工作流程

1. **用户登录**：用户使用中文昵称登录
2. **JWT 生成**：`JwtUtil.setAccessClaims` 检测到中文字符，进行 Base64 编码
3. **Token 签发**：生成包含编码后昵称的 JWT token
4. **网关验证**：JWT 验证通过后，从 token 中提取用户信息
5. **请求头转换**：`request-transformer` 将用户信息添加到请求头（已经是 Base64 编码）
6. **后端接收**：Java 拦截器接收到编码后的请求头
7. **中文解码**：`decodeHeader` 方法进行 Base64 解码，还原中文
8. **上下文设置**：将解码后的用户信息设置到 `UserContext`

## 支持的请求头
- `X-User-Nickname`：用户昵称
- `X-User-Username`：用户名

## 测试建议
1. 创建一个包含中文昵称的用户
2. 登录获取 JWT token
3. 使用该 token 访问需要认证的接口
4. 检查后端 `UserContext` 中的昵称是否正确显示中文

## 注意事项
- 只有包含中文字符的字符串才会被编码
- 如果解码失败，会使用原始值并记录调试日志
- 编码使用 UTF-8 字符集
- Base64 编码确保 HTTP 请求头只包含 ASCII 字符
- 编码在 JWT 生成时进行，避免在网关层处理
