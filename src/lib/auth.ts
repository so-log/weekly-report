import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./database";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export const auth = {
  // 비밀번호 해시
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  // 비밀번호 검증
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  // JWT 토큰 생성
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  // JWT 토큰 검증
  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  },

  // 사용자 등록
  async register(email: string, password: string, name: string) {
    // 이미 존재하는 사용자 확인
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      throw new Error("이미 존재하는 이메일입니다.");
    }

    // 비밀번호 해시
    const passwordHash = await this.hashPassword(password);

    // 사용자 생성
    const user = await db.users.create({
      email,
      name,
      password_hash: passwordHash,
    });

    // JWT 토큰 생성
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        team_id: user.team_id,
        role: user.role,
      },
      token,
    };
  },

  // 사용자 로그인
  async login(email: string, password: string) {
    // 사용자 찾기
    const user = await db.users.findByEmail(email);
    if (!user) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // 비밀번호 검증
    const isValidPassword = await this.verifyPassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // JWT 토큰 생성
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        team_id: user.team_id,
        role: user.role,
      },
      token,
    };
  },

  // 토큰에서 사용자 정보 추출
  async getUserFromToken(token: string) {
    try {
      const payload = this.verifyToken(token);
      const user = await db.users.findById(payload.userId);

      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        team_id: user.team_id,
        role: user.role,
      };
    } catch (error) {
      throw new Error("유효하지 않은 토큰입니다.");
    }
  },
};
