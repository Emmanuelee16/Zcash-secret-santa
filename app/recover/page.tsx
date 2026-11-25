import RecoverForm from "@/components/RecoverForm";

export default function Recover() {
  return (
    <main className="page wrap">
      <p className="eyebrow">Find my link</p>
      <h1>Lost your link?</h1>
      <p className="muted" style={{ maxWidth: "46ch", marginBottom: 34, lineHeight: 1.6 }}>
        Your name and PIN are enough to get back in. The PIN was set when you joined.
      </p>
      <RecoverForm />
    </main>
  );
}
