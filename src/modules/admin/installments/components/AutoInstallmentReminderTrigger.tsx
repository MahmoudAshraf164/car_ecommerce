"use client";

import { useEffect, useRef } from "react";

export function AutoInstallmentReminderTrigger() {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Check localStorage to avoid repeated hits in same 4 hours
    const lastCheckKey = "last_installment_reminder_check";
    const lastCheck = localStorage.getItem(lastCheckKey);
    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000;

    if (!lastCheck || now - parseInt(lastCheck, 10) > fourHours) {
      fetch("/api/installments/check-reminders", {
        method: "POST",
      })
        .then(() => {
          localStorage.setItem(lastCheckKey, now.toString());
        })
        .catch((err) => {
          console.warn("[AutoReminder] Background check skipped/failed:", err);
        });
    }
  }, []);

  return null;
}
