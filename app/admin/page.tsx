import AdminPanel from "@/components/AdminPanel";

export default function Admin() {
  return (
    <main className="page wrap">
      <p className="eyebrow">Organiser</p>
      <h1>Matching desk.</h1>
      <p className="muted" style={{ maxWidth: "46ch", lineHeight: 1.6 }}>
        Run the pairing, set the dates, watch who has sent. The key is set as
        ADMIN_KEY in the environment.
      </p>
      <AdminPanel />
    </main>
  );
}
