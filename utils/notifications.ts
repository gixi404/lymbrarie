import toast from "react-hot-toast";

function notification(noti: Notis, msg: string): void {
  toast[noti](msg, {
    id: msg,
    duration: noti == "loading" ? 50000 : 2500,
    style: {
      backgroundColor: "#090d16",
      color: "#f8fafc",
      padding: "10px 18px",
      borderRadius: "12px",
      border: "1px solid rgba(139, 92, 246, 0.3)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
      zIndex: 9999,
    },
    iconTheme: {
      primary: noti === "error" ? "#ef4444" : "#a855f7",
      secondary: "#090d16",
    },
  });
}

function dismissNoti(id?: string): void {
  return id ? toast.dismiss(id) : toast.dismiss();
}

export { dismissNoti, notification };

type Notis = "success" | "error" | "loading";
