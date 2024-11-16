import prisma from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { registerAppUserSchema } from "@/lib/dtos";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { TRPCError } from "@trpc/server";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const registerAppUser = publicProcedure.input(registerAppUserSchema).mutation(async ({ input, ctx }) => {
    try {
        const { first_name, last_name, phone_number, email, password, profile_picture, date_of_birth } = input;
        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePictureUrl = null;
        if (profile_picture) {
            const uploadResult = await cloudinary.uploader.upload(profile_picture, {
                upload_preset: email,
      });
            profilePictureUrl = uploadResult.secure_url;
        }
        
        const appUser = await prisma.appUser.create({
            data: {
                first_name,
                last_name, 
                phone_number,
                email,
                password: hashedPassword,
                profile_picture: profilePictureUrl,
                date_of_birth
            }
        });

        return {
            success: true,
            user: {
                id: appUser.id,
                email: appUser.email,
                first_name: appUser.first_name,
                last_name: appUser.last_name,
                phone_number: appUser.phone_number,
                profile_picture: appUser.profile_picture,
                date_of_birth: appUser.date_of_birth
            }
        };

    } catch (error) {
        console.error("Error registering app user:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to register user"
        });
    }
});     