"use client";

import { useState } from "react";
import { Home, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { TextareaField } from "@/components/ui/textarea";
import { applyAdoption } from "@/lib/actions";
import { validatePhone, validateName, validateReason } from "@/lib/validations";

interface AdoptFormProps {
  dogId: string;
  dogName: string;
  onSuccess?: () => void;
}

type State = "idle" | "loading" | "success" | "error";

export function AdoptForm({ dogId, dogName, onSuccess }: AdoptFormProps) {
  const [name,   setName]   = useState("");
  const [phone,  setPhone]  = useState("");
  const [reason, setReason] = useState("");
  const [error,  setError]  = useState("");
  const [state,  setState]  = useState<State>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateName(name))    { setError("กรุณากรอกชื่อ"); return; }
    if (!validatePhone(phone))  { setError("เบอร์โทรไม่ถูกต้อง (เช่น 081xxxxxxx)"); return; }
    if (!validateReason(reason)){ setError("กรุณาเขียนเหตุผล (อย่างน้อย 10 ตัวอักษร)"); return; }

    setState("loading");
    const result = await applyAdoption(dogId, name, phone, reason);
    if (result.success) {
      setState("success");
      onSuccess?.();
    } else {
      setError(result.error);
      setState("idle");
    }
  };

  if (state === "success") {
    return (
      <div className="text-center py-4">
        <CheckCircle className="mx-auto mb-3 text-secondary" size={40} />
        <p className="font-semibold text-foreground">ส่งคำขอรับเลี้ยงน้อง{dogName} แล้วค่ะ 🏠</p>
        <p className="text-sm text-muted-foreground mt-1">ทีมงานจะติดต่อกลับภายใน 1-3 วันทำการ</p>
        <p className="text-sm text-muted-foreground mt-3">
          ตรวจสอบสถานะได้ที่{" "}
          <a href="/status" className="text-primary underline">หน้าตรวจสอบสถานะ</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        ยื่นคำขอรับเลี้ยงน้อง <span className="font-medium text-foreground">{dogName}</span> ได้เลยค่ะ
      </p>
      <InputField
        label="ชื่อ-นามสกุล"
        placeholder="ชื่อของคุณ"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <InputField
        label="เบอร์โทรศัพท์"
        placeholder="081xxxxxxx"
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        hint="สำหรับให้ทีมงานติดต่อกลับค่ะ"
        required
      />
      <TextareaField
        label="เหตุผลที่อยากรับเลี้ยง"
        placeholder="เล่าให้ฟังหน่อยค่ะ ว่าทำไมถึงอยากรับน้องไปเลี้ยง..."
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="default" size="pill" isLoading={state === "loading"} className="w-full">
        <Home size={16} />
        ยื่นคำขอรับเลี้ยง
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        หรือ{" "}
        <a
          href={`https://t.me/PawHomeBot?start=adopt_${dogId}`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ติดต่อผ่าน Telegram Bot
        </a>
      </p>
    </form>
  );
}
