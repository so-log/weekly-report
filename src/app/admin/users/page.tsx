"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import NavigationHeader from "@/components/NavigationHeader";
import { Users, Shield, User, Calendar, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "manager";
  team_id: string | null;
  team_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const fetchUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((e) => console.error("사용자 목록 불러오기 실패", e));
  };

  useEffect(() => {
    // 팀 목록 불러오기
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((e) => console.error("팀 목록 불러오기 실패", e));

    // 사용자 목록 불러오기
    fetchUsers();
    setIsLoading(false);
  }, []);

  // 관리자 권한 확인
  if (
    !currentUser ||
    (currentUser.role !== "admin" && currentUser.role !== "manager")
  ) {
    router.push("/");
    return null;
  }

  const handleUpdateUser = async (
    userId: string,
    updates: { role?: string; team_id?: string | null }
  ) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "사용자 정보가 업데이트되었습니다.",
        });
        fetchUsers(); // 목록 새로고침
      } else {
        throw new Error("업데이트 실패");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "오류",
        description: "사용자 정보 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "사용자가 삭제되었습니다.",
        });
        fetchUsers(); // 목록 새로고침
      } else {
        throw new Error("삭제 실패");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "오류",
        description: "사용자 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">관리자</Badge>;
      case "manager":
        return <Badge variant="default">매니저</Badge>;
      default:
        return <Badge variant="secondary">사용자</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield size={16} />;
      case "manager":
        return <Users size={16} />;
      default:
        return <User size={16} />;
    }
  };

  // 팀별 필터링
  const filteredUsers =
    selectedTeam && selectedTeam !== "all"
      ? users.filter((u) => u.team_id === selectedTeam)
      : users;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <NavigationHeader />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>돌아가기</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                사용자 관리
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                전체 사용자 목록 및 권한 관리
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>사용자 목록 ({users.length}명)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 space-x-4">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="팀별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>팀</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.team_id || ""}
                        onValueChange={(value) =>
                          handleUpdateUser(user.id, { team_id: value || null })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="팀 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">팀 없음</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>
                          {format(new Date(user.created_at), "yyyy.MM.dd", {
                            locale: ko,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(user);
                            setEditForm(user);
                          }}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteUser(user)}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 수정 모달 */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <Input
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이메일</label>
              <Input
                value={editForm.email || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">팀</label>
              <Select
                value={editForm.team_id || ""}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, team_id: v }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="팀 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">없음</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">역할</label>
              <Select
                value={editForm.role || "user"}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, role: v as User["role"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">사용자</SelectItem>
                  <SelectItem value="manager">매니저</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              취소
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (editingUser) {
                  handleUpdateUser(editingUser.id, editForm);
                  setEditingUser(null);
                }
              }}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 모달 */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 삭제</DialogTitle>
            <DialogDescription>
              정말로 <b>{deleteUser?.name}</b> 사용자를 삭제하시겠습니까? 이
              작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteUser) {
                  handleDeleteUser(deleteUser.id);
                  setDeleteUser(null);
                }
              }}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
