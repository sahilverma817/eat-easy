import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/session";
import { setUser } from "@/lib/redis";
import { ACCESSORIES, LEVEL_PRICES } from "@/lib/avatar-shop";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { itemId, type } = await req.json();

    if (type === "accessory") {
      const item = ACCESSORIES.find((a) => a.id === itemId);
      if (!item) throw new HttpError(400, "Unknown accessory.");
      if (user.unlockedAccessories.includes(item.id)) {
        throw new HttpError(409, "Already unlocked.");
      }
      if (user.coins < item.price) throw new HttpError(402, "Not enough coins.");
      user.coins -= item.price;
      user.unlockedAccessories.push(item.id);
    } else if (type === "level") {
      const targetLevel = Number(itemId);
      if (![2, 3, 4, 5].includes(targetLevel)) throw new HttpError(400, "Invalid level.");
      if (targetLevel !== user.avatarLevel + 1) {
        throw new HttpError(400, "Must upgrade one level at a time.");
      }
      const price = LEVEL_PRICES[targetLevel];
      if (user.coins < price) throw new HttpError(402, "Not enough coins.");
      user.coins -= price;
      user.avatarLevel = targetLevel;
    } else {
      throw new HttpError(400, "Invalid purchase type.");
    }

    await setUser(user);
    const { pinHash, ...rest } = user;
    return NextResponse.json({ ok: true, user: rest });
  } catch (e) {
    return errorResponse(e);
  }
}
