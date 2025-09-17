// SidebarUtilities.tsx
import { resetLocal, inspectIndexedDB } from "../../db/localDB";

export function SidebarUtilities() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
      <button
        style={{ background: "#dc2626", color: "white", padding: "6px", borderRadius: "4px" }}
        onClick={() => {
          console.log("[Sidebar][click] Reset Local Storage");
          resetLocal();
        }}
      >
        🗑 Reset Local Storage
      </button>
      <button
        style={{ background: "#268c26", color: "white", padding: "6px", borderRadius: "4px" }}
        onClick={() => {
          console.log("[Sidebar][click] Check Local Storage");
          inspectIndexedDB();
        }}
      >
        Check Local Storage
      </button>
    </div>
  );
}
