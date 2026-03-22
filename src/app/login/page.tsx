import LoginBrandPanel from "./LoginBrandPanel";
import LoginForm       from "./LoginForm";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        fontFamily: "var(--font-sans)",
      }}
    >
      <LoginBrandPanel />
      <LoginForm />
    </div>
  );
}
