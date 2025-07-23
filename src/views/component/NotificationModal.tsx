"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/Dialog";
import { useToast } from "../viewModel/use-toast";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function NotificationModal({
  isOpen,
  onClose,
  recipient,
}: NotificationModalProps) {
  const [subType, setSubType] = useState<"report_request" | "announcement">(
    "report_request"
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient) return;

    // 보고서 요청일 때는 메시지 검증하지 않음
    if (subType === "announcement" && !message.trim()) {
      toast({
        title: "입력 오류",
        description: "공지사항 메시지를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      // 보고서 요청일 때는 자동으로 제목과 메시지 생성
      const title =
        subType === "report_request" ? "보고서 제출 요청" : "공지사항";

      const notificationMessage =
        subType === "report_request"
          ? "보고서 제출이 필요합니다. 주간업무보고를 작성해주세요."
          : message.trim();

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: recipient.id,
          title,
          message: notificationMessage,
          type: "manual",
          subType,
        }),
      });

      if (response.ok) {
        toast({
          title: "알림 전송 성공",
          description: `${recipient.name}에게 알림이 전송되었습니다.`,
        });
        handleClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || "알림 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "알림 전송 실패",
        description:
          error instanceof Error
            ? error.message
            : "알림 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSubType("report_request");
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>알림 보내기</DialogTitle>
          <DialogDescription>
            {recipient?.name} ({recipient?.email})에게 알림을 보냅니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subType" className="text-sm font-medium">
              알림 유형
            </label>
            <Select
              value={subType}
              onValueChange={(value: "report_request" | "announcement") =>
                setSubType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="report_request">보고서 요청</SelectItem>
                <SelectItem value="announcement">공지사항</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {subType === "announcement" && (
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                공지사항 메시지
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="공지사항 메시지를 입력하세요"
                rows={4}
                required
              />
            </div>
          )}

          {subType === "report_request" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                보고서 요청 알림이 전송됩니다. 사용자에게 "보고서 제출이
                필요합니다" 메시지가 자동으로 전송됩니다.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "전송 중..." : "알림 전송"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
