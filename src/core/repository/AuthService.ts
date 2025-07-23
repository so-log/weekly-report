import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DatabaseRepository } from "./DatabaseRepository";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  team_id: string | null;
  role: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  }

  async register(
    email: string,
    password: string,
    name: string,
    teamId?: string
  ): Promise<AuthResult> {
    const existingUser = await DatabaseRepository.users.findByEmail(email);
    if (existingUser) {
      throw new Error("이미 존재하는 이메일입니다.");
    }

    const passwordHash = await this.hashPassword(password);

    const user = await DatabaseRepository.users.create({
      email,
      name,
      password_hash: passwordHash,
      team_id: teamId || null,
      role: "user",
    });

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
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await DatabaseRepository.users.findByEmail(email);
    if (!user) {
      throw new Error(
        "존재하지 않는 이메일입니다. 회원가입을 먼저 진행해주세요."
      );
    }

    const isValidPassword = await this.verifyPassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error("비밀번호가 올바르지 않습니다.");
    }

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
  }

  async getUserFromToken(token: string): Promise<AuthUser> {
    try {
      const payload = this.verifyToken(token);
      const user = await DatabaseRepository.users.findById(payload.userId);

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
  }
}

// 싱글톤 인스턴스
export const authService = new AuthService();