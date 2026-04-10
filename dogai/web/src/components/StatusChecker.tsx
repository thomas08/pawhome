"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, Home, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { checkStatus, type StatusResult } from "@/lib/actions";
import { validatePhone } from "@/lib/validations";
import { formatRelativeTime } from "@/lib/utils";

const adoptionStatusLabel: Record<string, string> = {
  pending:  "รอพิจารณา",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่ผ่าน",
};

const adoptionStatusVariant: Record<string, "amber" | "teal" | "gray"> = {
  pending:  "amber",
  approved: "teal",
  rejected: "gray",
};

const adoptionStatusIcon: Record<string, React.ReactNode> = {
  pending:  <Clock size={14} />,
  approved: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
};

export function StatusChecker() {
  const [phone,  setPhone]  = useState("");
  const [error,  setError]  = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validatePhone(phone)) { setError("เบอร์โทรไม่ถูกต้อง (เช่น 081xxxxxxx)"); return; }
    setLoading(true);
    const data = await checkStatus(phone);
    setResult(data);
    setLoading(false);
    if (data === null) setError("ไม่พบข้อมูลสำหรับเบอร์นี้ค่ะ");
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="081xxxxxxx"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(""); setResult(undefined); }}
          className="flex-1"
        />
        <Button type="submit" isLoading={loading} size="md">
          <Search size={16} />
          ค้นหา
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Follows */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-3">
              <Heart size={16} className="text-coral-500 fill-coral-500" />
              น้องหมาที่ติดตาม ({result.follows.length})
            </h2>
            {result.follows.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่ได้ติดตามน้องหมาตัวไหนค่ะ</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {result.follows.map((f) => (
                  <Link key={f.dogId} href={`/dogs/${f.dogId}`}>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-accent shrink-0">
                        {f.dogPhoto ? (
                          <Image src={f.dogPhoto} alt={f.dogName} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xl">🐶</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{f.dogName}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(new Date(f.createdAt))}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Adoptions */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-3">
              <Home size={16} className="text-primary" />
              คำขอรับเลี้ยง ({result.adoptions.length})
            </h2>
            {result.adoptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีคำขอรับเลี้ยงค่ะ</p>
            ) : (
              <div className="flex flex-col gap-2">
                {result.adoptions.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                    <div>
                      <Link href={`/dogs/${a.dogId}`} className="text-sm font-medium text-foreground hover:text-primary">
                        {a.dogName}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(new Date(a.appliedAt))}</p>
                    </div>
                    <Badge variant={adoptionStatusVariant[a.status] ?? "gray"} className="flex items-center gap-1">
                      {adoptionStatusIcon[a.status]}
                      {adoptionStatusLabel[a.status] ?? a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
