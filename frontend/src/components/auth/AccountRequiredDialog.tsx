import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccountRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountRequiredDialog = ({ open, onOpenChange }: AccountRequiredDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-2 font-lexend backdrop-blur-xl sm:max-w-md"
        style={{
          background: "linear-gradient(26.82deg, rgba(103, 137, 236, 0.18) 64.12%, rgba(103, 137, 236, 0.28) 89.86%)",
          borderColor: "rgba(103, 137, 236, 1)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            You need an account for this.
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Keep browsing, or create an account when you are ready to commit to a project.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full rounded-xl"
            style={{ backgroundColor: "#A6F4C5", color: "#111118" }}
            onClick={() => {
              onOpenChange(false);
              navigate("/welcome");
            }}
          >
            Make an account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountRequiredDialog;
