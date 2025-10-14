// src/middleware.js
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/", "/dashboard/:path*", "/service/:path*", "/profile", "/settings"],
};
