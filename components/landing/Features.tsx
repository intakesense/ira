import { BarChart3, ShieldCheck, Users, Briefcase } from "lucide-react";
import { colors } from "@/lib/theme/colors";

export const Features = () => {
  return (
    <section
      style={{
        padding: "6rem 0",
        backgroundColor: colors.white,
      }}
      id="features"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1rem" }}>
        {/* HEADER */}
        <div
          style={{
            textAlign: "center",
            maxWidth: 720,
            margin: "0 auto 4rem",
          }}
        >
          <h2
            style={{
              color: colors.brand[700],
              fontWeight: 600,
              letterSpacing: "0.08em",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            Beyond the Checklist
          </h2>

          <h3
            style={{
              marginTop: 12,
              fontSize: 36,
              fontWeight: 700,
              color: colors.gray[900],
            }}
          >
            The IRA Deep-Dive Assessment
          </h3>

          <p
            style={{
              marginTop: 16,
              fontSize: 18,
              color: colors.gray[500],
              lineHeight: 1.6,
            }}
          >
            Eligibility is just the first step. Our internal IRA tool analyzes
            50+ financial and strategic signals to maximize listing success.
          </p>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 32,
          }}
        >
          {[
            {
              icon: BarChart3,
              title: "3-Year Financial Scan",
              desc: "Deep analysis of balance sheets and P&L trends investors care about.",
            },
            {
              icon: ShieldCheck,
              title: "Compliance Audit",
              desc: "Automated checks against the latest SEBI and exchange regulations.",
            },
            {
              icon: Users,
              title: "Peer Benchmarking",
              desc: "Compare your metrics against recently listed companies in your sector.",
            },
            {
              icon: Briefcase,
              title: "Valuation Estimator",
              desc: "Preliminary valuation range based on fundamentals and market sentiment.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                padding: 28,
                borderRadius: 20,
                background: `linear-gradient(
                  135deg,
                  rgba(37, 99, 235, 0.06),
                  rgba(219, 234, 254, 0.55)
                )`,
                border: "1px solid rgba(37, 99, 235, 0.15)",
                backdropFilter: "blur(6px)",
                boxShadow: "0 14px 30px rgba(29,78,216,0.15)",
                transition: "all 0.35s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 26px 60px rgba(29,78,216,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px rgba(29,78,216,0.15)";
              }}
            >
              {/* ICON */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `linear-gradient(
                    135deg,
                    ${colors.brand[700]},
                    ${colors.brand[600]}
                  )`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  boxShadow: "0 10px 20px rgba(29,78,216,0.4)",
                }}
              >
                <Icon size={26} color={colors.white} />
              </div>

              <h4
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.gray[900],
                  marginBottom: 10,
                }}
              >
                {title}
              </h4>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: colors.gray[500],
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
