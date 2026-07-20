import { toast } from "vue-sonner";

// Every profile-field save (text, chips, select, date) does the same thing:
// call updateProfile, toast success or failure. One place to change that
// policy instead of seven.
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
