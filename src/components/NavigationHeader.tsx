"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  LogOut,
  User,
  Settings,
  FileText,
  Users,
  Moon,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function NavigationHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleViewReports = () => {
    router.push("/reports");
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1
              className="text-xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => router.push("/")}
            >
              주간업무보고 시스템
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* 사용자 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewReports}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>내 보고서</span>
                </DropdownMenuItem>
                {(user?.role === "admin" || user?.role === "manager") && (
                  <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>사용자 관리</span>
                  </DropdownMenuItem>
                )}
                {/* 설정 메뉴: user가 아닐 때만 노출, 관리자/매니저는 사용자 관리로 이동 */}
                {user?.role !== "user" && (
                  <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleThemeToggle}>
                  {theme === "light" ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  <span>{theme === "light" ? "다크모드" : "라이트모드"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
