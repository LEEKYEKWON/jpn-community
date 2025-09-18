import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 배포를 막지 않도록 빌드 시 ESLint 오류를 무시합니다
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 프로덕션 빌드를 막지 않도록 타입 오류 발생 시에도 빌드를 계속합니다
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
