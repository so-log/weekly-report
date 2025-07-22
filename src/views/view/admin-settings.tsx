"use client";

import { useState, useEffect } from "react";
import { Button } from "../component/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../component/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../component/ui/Select";
import { Badge } from "../component/ui/Badge";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";

interface Team {
  id: string;
  name: string;
  description: string | null;
}

interface NotificationSetting {
  id: string;
  team_id: string;
  day_of_week: number;
  is_active: boolean;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "일요일" },
  { value: "1", label: "월요일" },
  { value: "2", label: "화요일" },
  { value: "3", label: "수요일" },
  { value: "4", label: "목요일" },
  { value: "5", label: "금요일" },
  { value: "6", label: "토요일" },
];

export default function NotificationSettingsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // 팀 목록 조회
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/teams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const teamsData = await response.json();
          setTeams(teamsData);
          if (teamsData.length > 0) {
            setSelectedTeam(teamsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  // 선택된 팀의 알림 설정 조회
  useEffect(() => {
    if (!selectedTeam) return;

    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `/api/notifications/settings?teamId=${selectedTeam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const settingsData = await response.json();
          setSettings(settingsData);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, [selectedTeam]);

  const handleAddSetting = async () => {
    if (!selectedTeam || !selectedDay) {
      toast({
        title: "입력 오류",
        description: "팀과 요일을 모두 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/notifications/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: selectedTeam,
          dayOfWeek: parseInt(selectedDay),
          isActive: true,
        }),
      });

      if (response.ok) {
        const newSetting = await response.json();
        setSettings([...settings, newSetting]);
        setSelectedDay(""); // 요일 선택 초기화
        toast({
          title: "설정 추가 성공",
          description: `${
            DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.label
          } 알림이 추가되었습니다.`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "설정 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error adding setting:", error);
      toast({
        title: "설정 추가 실패",
        description:
          error instanceof Error
            ? error.message
            : "설정 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetting = async (setting: NotificationSetting) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/notifications/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: setting.team_id,
          dayOfWeek: setting.day_of_week,
          isActive: !setting.is_active,
        }),
      });

      if (response.ok) {
        const updatedSetting = await response.json();
        setSettings(
          settings.map((s) => (s.id === setting.id ? updatedSetting : s))
        );
        toast({
          title: "설정 업데이트 성공",
          description: `알림 설정이 업데이트되었습니다.`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "설정 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      toast({
        title: "설정 업데이트 실패",
        description:
          error instanceof Error
            ? error.message
            : "설정 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSetting = async (setting: NotificationSetting) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/notifications/settings?teamId=${setting.team_id}&dayOfWeek=${setting.day_of_week}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSettings(settings.filter((s) => s.id !== setting.id));
        toast({
          title: "설정 삭제 성공",
          description: "알림 설정이 삭제되었습니다.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "설정 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting setting:", error);
      toast({
        title: "설정 삭제 실패",
        description:
          error instanceof Error
            ? error.message
            : "설정 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDayLabel = (dayOfWeek: number) => {
    return (
      DAYS_OF_WEEK.find((day) => day.value === dayOfWeek.toString())?.label ||
      ""
    );
  };

  const getAvailableDays = () => {
    const usedDays = new Set(settings.map((s) => s.day_of_week));
    return DAYS_OF_WEEK.filter((day) => !usedDays.has(parseInt(day.value)));
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mt-2">
            관리자만 이 페이지에 접근할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">알림 설정</h1>
        <p className="text-gray-600 mt-2">
          팀별로 자동 알림을 보낼 요일을 설정할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>
              팀별로 자동 알림을 보낼 요일을 설정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 팀과 요일 선택 */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    팀 선택
                  </label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="팀을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    요일 선택
                  </label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="요일을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDays().map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddSetting}
                  disabled={isLoading || !selectedDay || !selectedTeam}
                  className="w-full"
                >
                  설정 추가
                </Button>
              </div>

              {/* 현재 설정 */}
              {selectedTeam && settings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {teams.find((t) => t.id === selectedTeam)?.name} - 현재 설정
                  </h3>
                  <div className="grid gap-2">
                    {settings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              setting.is_active ? "default" : "secondary"
                            }
                          >
                            {getDayLabel(setting.day_of_week)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {setting.is_active ? "활성화" : "비활성화"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleSetting(setting)}
                            disabled={isLoading}
                          >
                            {setting.is_active ? "비활성화" : "활성화"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSetting(setting)}
                            disabled={isLoading}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTeam &&
                settings.length === 0 &&
                getAvailableDays().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    모든 요일이 설정되었습니다.
                  </div>
                )}

              {selectedTeam &&
                settings.length === 0 &&
                getAvailableDays().length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    아직 설정된 알림이 없습니다. 위에서 요일을 선택하여
                    추가해주세요.
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}