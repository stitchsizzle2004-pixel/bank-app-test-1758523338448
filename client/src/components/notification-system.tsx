import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface NotificationProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  onDismiss: (id: string) => void;
}

const Notification = ({ id, title, description, variant = "default", onDismiss }: NotificationProps) => {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500";
      case "destructive":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className={`notification ${getBgColor()} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}>
      {getIcon()}
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button 
        onClick={() => onDismiss(id)}
        className="ml-4 hover:bg-white/20 p-1 rounded transition-colors"
        data-testid="button-close-notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const NotificationSystem = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Notification
          key={toast.id}
          id={toast.id}
          title={toast.title?.toString()}
          description={toast.description?.toString()}
          variant={toast.variant as "default" | "destructive" | "success"}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};
