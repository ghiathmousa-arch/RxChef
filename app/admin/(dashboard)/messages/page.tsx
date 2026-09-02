import { prisma } from "@/lib/prisma";
import { toggleMessageRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-5">
        <p className="text-xl font-semibold text-forest">الرسائل</p>
        <p className="mt-1.75 text-[13.5px] text-sand">ملاحظات واردة من نموذج التواصل.</p>
      </div>

      <div className="grid gap-2.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-2xl border bg-paper px-5 py-4.5"
            style={{ borderColor: msg.isRead ? "rgba(175,184,181,.5)" : "rgba(52,143,128,.35)" }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[15px] font-medium text-forest">{msg.name}</span>
              <span dir="ltr" className="font-latin text-[13px] text-sand">
                {msg.email}
              </span>
              <span dir="ltr" className="mr-auto font-latin text-[13px] text-sand">
                {msg.createdAt.toLocaleString("ar-SY", { dateStyle: "medium", timeStyle: "short" })}
              </span>
              <form action={toggleMessageRead}>
                <input type="hidden" name="id" value={msg.id} />
                <input type="hidden" name="nextIsRead" value={(!msg.isRead).toString()} />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg px-2.5 py-1 text-[12.5px] whitespace-nowrap"
                  style={{
                    color: msg.isRead ? "#AFB8B5" : "#348F80",
                    background: msg.isRead ? "rgba(175,184,181,.16)" : "rgba(52,143,128,.10)",
                  }}
                >
                  {msg.isRead ? "مقروءة" : "غير مقروءة"}
                </button>
              </form>
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.85] text-ink/78">{msg.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-[14px] text-sand">لا رسائل بعد.</p>}
      </div>
    </div>
  );
}
