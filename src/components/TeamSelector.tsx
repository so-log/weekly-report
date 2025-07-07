"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { ChevronDown, Users } from "lucide-react";

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
    <div className={`flex items-center space-x-2 ${className}`}>
      <Users size={16} className="text-gray-500" />
      <Select
        value={selectedTeamId || ""}
        onValueChange={(value) => onTeamChange(value || null)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="팀을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">전체 팀</SelectItem>
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
