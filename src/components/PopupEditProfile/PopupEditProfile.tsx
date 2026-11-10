"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import cn from "clsx";
import Popup, { type PopupProps } from "@/components/ui/Popup/Popup";
import TextInput from "@/components/ui/TextInput/TextInput";
import Textarea from "@/components/ui/Textarea/Textarea";
import { Button } from "@/components/ui/Button/Button";
import type { PublicUserProfile } from "@/lib/users";
import styles from "./PopupEditProfile.module.scss";

interface EditProfileFormData {
  username: string;
  city: string;
  about: string;
}

export interface PopupEditProfileProps
  extends Omit<PopupProps, "children" | "title" | "open" | "onClose"> {
  open: boolean;
  setOpen: (open: boolean) => void;
  profile: PublicUserProfile;
}

function getErrorMessage(error: unknown) {
  return error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : undefined;
}

export const PopupEditProfile = ({
  open,
  setOpen,
  profile,
  className,
  classNames,
  ...popupProps
}: PopupEditProfileProps) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      username: profile.username ?? "",
      city: profile.city ?? "",
      about: profile.about ?? "",
    },
  });

  const handleClose = () => {
    if (!isSubmitting) setOpen(false);
  };

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username.trim(),
          city: data.city.trim(),
          about: data.about.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json();

        if (body.errors) {
          for (const [field, message] of Object.entries(body.errors)) {
            setError(field as keyof EditProfileFormData, {
              message: message as string,
            });
          }
          return;
        }

        throw new Error(body.error || "Ошибка сервера");
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("root.serverError", {
        message: "Не удалось сохранить. Попробуйте ещё раз.",
      });
    }
  };

  return (
    <Popup
      {...popupProps}
      open={open}
      onClose={handleClose}
      title="Редактировать профиль"
      className={cn(styles.popup, className)}
      classNames={classNames}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <TextInput
            {...register("username", {
              required: "Введите имя",
              validate: (v) => v.trim().length > 0 || "Введите имя",
              maxLength: { value: 32, message: "Не более 32 символов" },
            })}
            placeholder="Имя"
            errorText={getErrorMessage(errors.username)}
            aria-invalid={Boolean(errors.username)}
          />
        </div>

        <div className={styles.field}>
          <TextInput
            {...register("city", {
              maxLength: { value: 100, message: "Не более 100 символов" },
            })}
            placeholder="Город"
            errorText={getErrorMessage(errors.city)}
            aria-invalid={Boolean(errors.city)}
          />
        </div>

        <div className={styles.field}>
          <Textarea
            {...register("about", {
              maxLength: { value: 500, message: "Не более 500 символов" },
            })}
            placeholder="Краткое описание"
            errorText={getErrorMessage(errors.about)}
            aria-invalid={Boolean(errors.about)}
          />
        </div>

        {errors.root?.serverError && (
          <div className={styles.error} role="alert">
            {getErrorMessage(errors.root.serverError)}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            type="button"
            view="secondary"
            isDisabled={isSubmitting}
            onClick={handleClose}
          >
            Отмена
          </Button>
          <Button type="submit" view="positive" isLoading={isSubmitting}>
            Сохранить
          </Button>
        </div>
      </form>
    </Popup>
  );
};

PopupEditProfile.displayName = "PopupEditProfile";

export default PopupEditProfile;
