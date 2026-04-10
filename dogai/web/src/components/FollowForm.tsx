"use client";

import { useState } from "react";
import { Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { followDog } from "@/lib/actions";
import { validatePhone, validateName } from "@/lib/validations";

interface FollowFormProps {
  dogId: string;
  dogName: string;
  onSuccess?: () => void;
}

type State = "idle" | "loading" | "success" | "already" | "error";

export function FollowForm({ dogId, dogName, onSuccess }: FollowFormProps) {
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<State>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateName(name))  { setError("กรุณากรอกชื่อ"); return; }
    if (!validatePhone(phone)) { setError("เบอร์โทรไม่ถูกต้อง (เช่น 081xxxxxxx)"); return; }

    setState("loading");
    const result = await followDog(dogId, name, phone);
    if (result.success) {
      setState(result.alreadyFollowing ? "already" : "success");
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
        <p className="font-semibold text-foreground">ติดตามน้อง{dogName} แล้วค่ะ 💕</p>
        <p className="text-sm text-muted-foreground mt-1">เราจะแจ้งเตือนเมื่อมีอัพเดทใหม่</p>
      </div>
    );
  }

  if (state === "already") {
    return (
      <div className="text-center py-4">
        <Heart className="mx-auto mb-3 text-coral-500 fill-coral-500" size={40} />
        <p className="font-semibold text-foreground">คุณติดตามน้อง{dogName} อยู่แล้วค่ะ</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        กรอกข้อมูลเพื่อติดตามน้อง <span className="font-medium text-foreground">{dogName}</span> ค่ะ
      </p>
      <InputField
        label="ชื่อ"
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
        hint="ใช้สำหรับรับการแจ้งเตือนอัพเดทค่ะ"
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="secondary" size="pill" isLoading={state === "loading"} className="w-full">
        <Heart size={16} />
        ติดตามน้อง{dogName}
      </Button>
    </form>
  );
}
