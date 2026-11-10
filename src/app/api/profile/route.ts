import { getAccessSession } from "@/lib/auth";
import { updateUserProfile } from "@/lib/users";

interface UpdateProfileBody {
  username?: string;
  city?: string;
  about?: string;
}

export async function PATCH(request: Request) {
  const session = await getAccessSession();

  if (!session) {
    return Response.json(
      { error: "Необходимо войти в аккаунт." },
      { status: 401 },
    );
  }

  let body: UpdateProfileBody;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const errors: Record<string, string> = {};

  if (body.username !== undefined) {
    const trimmed = body.username.trim();

    if (trimmed.length === 0) {
      errors.username = "Имя не может быть пустым.";
    } else if (trimmed.length > 32) {
      errors.username = "Имя не должно превышать 32 символа.";
    }
  }

  if (body.city !== undefined && body.city.trim().length > 100) {
    errors.city = "Город не должен превышать 100 символов.";
  }

  if (body.about !== undefined && body.about.trim().length > 500) {
    errors.about = "Описание не должно превышать 500 символов.";
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    const profile = await updateUserProfile(session.userId, {
      username: body.username?.trim(),
      city: body.city?.trim() || null,
      about: body.about?.trim() || null,
    });

    return Response.json(profile);
  } catch (error) {
    console.error("Failed to update profile", error);

    return Response.json(
      { error: "Не удалось сохранить профиль. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
