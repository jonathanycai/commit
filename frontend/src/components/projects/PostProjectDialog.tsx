import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createProject } from "@/lib/api";

// Options for checkboxes
const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
const roleOptions = ['Front-End', 'Back-End', 'Full Stack', 'Designer', 'Idea Guy', 'Pitch Wizard'];
const timeCommitmentOptions = ['1-2 hrs/week', '3-4 hrs/week', '5-6 hrs/week', '7-8 hrs/week', '8+ hrs/week'];

interface PostProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProjectCreated?: () => void;
}

const PostProjectDialog = ({ open, onOpenChange, onProjectCreated }: PostProjectDialogProps) => {
    const [projectTitle, setProjectTitle] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [experience, setExperience] = useState<string>("");
    const [roles, setRoles] = useState<string[]>([]);
    const [timeCommitment, setTimeCommitment] = useState<string>("");

    const handleSubmit = async () => {
        if (!projectTitle || !projectDescription) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const projectData = {
                title: projectTitle,
                description: projectDescription,
                tags: [],
                looking_for: roles,
                time_commitment: timeCommitment,
                // Note: experience level was not being sent in the original code, preserving that behavior
            };

            await createProject(projectData);
            toast.success("Project posted successfully!");

            // Reset form
            setProjectTitle("");
            setProjectDescription("");
            setExperience("");
            setRoles([]);
            setTimeCommitment("");

            onOpenChange(false);
            if (onProjectCreated) {
                onProjectCreated();
            }
        } catch (err) {
            console.error("Error creating project:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to create project";
            if (errorMessage.includes("No token") || errorMessage.includes("Unauthorized")) {
                toast.error("Please log in to create a project");
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const toggleExperience = (level: string) => {
        setExperience(prev => prev === level ? "" : level);
    };

    const toggleRole = (role: string) => {
        setRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const toggleTimeCommitment = (time: string) => {
        setTimeCommitment(prev => prev === time ? "" : time);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-4xl p-0 gap-0 border-2 font-lexend backdrop-blur-xl"
                style={{
                    background: "linear-gradient(26.82deg, rgba(103, 137, 236, 0.1) 64.12%, rgba(103, 137, 236, 0.2) 89.86%)",
                    border: "1.35px solid rgba(103, 137, 236, 1)"
                }}
            >
                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold">
                            This is a project kick!
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold">
                                Project Name
                            </Label>
                            <Input
                                id="title"
                                placeholder="Project name"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                className="bg-background/50 border-border rounded-xl h-12 w-2/5"
                            />
                        </div>

                        {/* <div className="space-y-2">
                            <Label className="text-sm font-semibold">Experience Level</Label>
                            <div className="flex flex-wrap gap-3">
                                {experienceOptions.map((level) => (
                                    <div key={level} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`dialog-exp-${level}`}
                                            checked={experience === level}
                                            onCheckedChange={() => toggleExperience(level)}
                                        />
                                        <label
                                            htmlFor={`dialog-exp-${level}`}
                                            className="text-sm font-medium leading-none cursor-pointer"
                                        >
                                            {level}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Role</Label>
                            <div className="flex flex-wrap gap-3">
                                {roleOptions.map((role) => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`dialog-role-${role}`}
                                            checked={roles.includes(role)}
                                            onCheckedChange={() => toggleRole(role)}
                                        />
                                        <label
                                            htmlFor={`dialog-role-${role}`}
                                            className="text-sm font-medium leading-none cursor-pointer"
                                        >
                                            {role}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Time Commitment</Label>
                            <div className="flex flex-wrap gap-3">
                                {timeCommitmentOptions.map((time) => (
                                    <div key={time} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`dialog-time-${time}`}
                                            checked={timeCommitment === time}
                                            onCheckedChange={() => toggleTimeCommitment(time)}
                                        />
                                        <label
                                            htmlFor={`dialog-time-${time}`}
                                            className="text-sm font-medium leading-none cursor-pointer"
                                        >
                                            {time}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold">
                                Description of the project you want to build!
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="This is a project that..."
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                className="bg-background/50 border-border rounded-xl min-h-[150px] resize-none"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="w-full h-14 text-base font-medium rounded-xl"
                            style={{ backgroundColor: "#A6F4C5", color: "#111118" }}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PostProjectDialog;
