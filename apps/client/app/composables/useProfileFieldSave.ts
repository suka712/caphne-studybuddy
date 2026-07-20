import { toast } from "vue-sonner";

export function useProfileFieldSave() {
  const { updateProfile } = useProfile();

  const saveProfileField = async (
    updates: Record<string, unknown>,
    options?: { successMessage?: string; errorMessage?: string },
  ) => {
    try {
      await updateProfile(updates);
      toast.success(options?.successMessage ?? "Updated");
      return true;
    } catch {
      toast.error(options?.errorMessage ?? "Failed to update");
      return false;
    }
  };

  return { saveProfileField };
}
