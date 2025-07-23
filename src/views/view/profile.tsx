"use client";

import { useAuth } from "../../hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "../component/ui/Button";
import { Input } from "../component/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../component/ui/Card";
import { Avatar, AvatarFallback } from "../component/ui/Avatar";
import { Badge } from "../component/ui/Badge";
import { User, Mail, Shield, Save, Edit } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../component/ui/Select";
import { AuthApiImpl } from "../../core/repository/AuthApiImpl";
import { UserApiImpl } from "../../core/repository/UserApiImpl";

const authApi = new AuthApiImpl();
const userApi = new UserApiImpl();

// 팀 목록 상수 추가
const TEAM_OPTIONS = [
  { id: "dev1", name: "개발 1팀" },
  { id: "dev2", name: "개발 2팀" },
  { id: "dev3", name: "개발 3팀" },
  { id: "plan", name: "기획 디자인 팀" },
];

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    team_id: user?.team_id || "dev1",
  });

  useEffect(() => {
    (async () => {
      const res = await authApi.me();
      if (res.data) {
        setUser({
          ...res.data,
          role: res.data.role || "user",
          team_id: res.data.team_id ?? null,
        });
      }
    })();
  }, [setUser]);

  useEffect(() => {}, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await userApi.updateUser({
        id: user.id,
        name: formData.name,
        email: formData.email,
        team_id: formData.team_id,
      });
      // 최신 user 정보 fetch 및 상태 갱신
      const res = await authApi.me();

      if (res.data) {
        setUser({
          ...res.data,
          role: res.data.role || "user",
          team_id: res.data.team_id ?? null,
        });
      }
      toast({
        title: "성공",
        description: "프로필이 업데이트되었습니다.",
      });
      setIsEditing(false);
    } catch {
      toast({
        title: "오류",
        description: "프로필 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      team_id: user?.team_id || "dev1",
    });
    setIsEditing(false);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "관리자";
      case "manager":
        return "매니저";
      case "user":
        return "사용자";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            프로필을 보려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              프로필
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              사용자 정보를 확인하고 수정할 수 있습니다.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    사용자 정보
                  </CardTitle>
                  <CardDescription>계정 정보를 관리합니다</CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        team_id: user.team_id || "dev1",
                      });
                      setIsEditing(true);
                    }}
                    className="flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 프로필 이미지 및 기본 정보 */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </h3>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleDisplay(user.role)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* 편집 폼 */}
              {isEditing && (
                <div className="space-y-4 border-t pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      이름
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      이메일
                    </label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="이메일을 입력하세요"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      팀
                    </label>
                    <Select
                      value={formData.team_id || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, team_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="팀을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_OPTIONS.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleSave} className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      저장
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {/* 계정 정보 */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  계정 정보
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      사용자 ID
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                      {user.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      역할
                    </span>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleDisplay(user.role)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">팀</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {TEAM_OPTIONS.find((t) => t.id === user.team_id)?.name ||
                        user.team_id ||
                        "-"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}