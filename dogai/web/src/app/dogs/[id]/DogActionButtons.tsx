"use client";

import { useState } from "react";
import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FollowForm } from "@/components/FollowForm";
import { AdoptForm } from "@/components/AdoptForm";

interface Props { dogId: string; dogName: string; isAvailable: boolean }

export function DogActionButtons({ dogId, dogName, isAvailable }: Props) {
  const [followOpen, setFollowOpen] = useState(false);
  const [adoptOpen,  setAdoptOpen]  = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => setFollowOpen(true)}
          variant="secondary"
          size="pill"
          className="justify-center"
        >
          <Heart size={18} /> ติดตามน้อง{dogName}
        </Button>
        {isAvailable && (
          <Button
            onClick={() => setAdoptOpen(true)}
            variant="default"
            size="pill"
            className="justify-center"
          >
            <Home size={18} /> ขอรับเลี้ยงน้อง{dogName}
          </Button>
        )}
      </div>

      <Dialog open={followOpen} onOpenChange={setFollowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ติดตามน้อง{dogName}</DialogTitle>
          </DialogHeader>
          <FollowForm dogId={dogId} dogName={dogName} onSuccess={() => setTimeout(() => setFollowOpen(false), 2000)} />
        </DialogContent>
      </Dialog>

      <Dialog open={adoptOpen} onOpenChange={setAdoptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ขอรับเลี้ยงน้อง{dogName}</DialogTitle>
          </DialogHeader>
          <AdoptForm dogId={dogId} dogName={dogName} onSuccess={() => setTimeout(() => setAdoptOpen(false), 3000)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
