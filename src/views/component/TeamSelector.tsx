"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Users } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string | null;
}

interface TeamSelectorProps {
  selectedTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  className?: string;
}

export default function TeamSelector({
  selectedTeamId,
  onTeamChange,
  className = "",
}: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Users size={16} className="text-gray-400" />
        <span className="text-gray-400">팀 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select
        value={selectedTeamId || "all"}
        onValueChange={(value) => onTeamChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-48 pl-8 relative">
          <Users
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <SelectValue placeholder="팀을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 팀</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
