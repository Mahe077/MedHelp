"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserInput, CreateUserSchema } from "@/lib/validation-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormHeader } from "@/components/common/app-form/form-header";
import { AppCard } from "@/components/common/app-form/app-card";
import { FormFooter } from "@/components/common/app-form/form-footer";
import { motion } from "motion/react";
import { AppButton } from "@/components/common/app-button";
import { Eye, EyeOff } from "lucide-react";
import { AppFormBody } from "@/components/common/app-form/app-form-body";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { AppCalendar } from "@/components/common/app-calendar";
import { PasswordStrengthIndicator } from "@/components/common/password-strength-indicator";
import { usePasswordValidationRules } from "@/hooks/usePasswordValidationRules";
import { apiSignup } from "@/lib/apis/auth";

type Step = 1 | 2 | 3;

export default function SignupPage() {
    const [step, setStep] = useState<Step>(1);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const passwordValidationRules = usePasswordValidationRules();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        trigger,
        control,
        watch,
    } = useForm<CreateUserInput>({
        resolver: zodResolver(CreateUserSchema),
        mode: "onChange",
        defaultValues: {
            role: "PATIENT",
        },
    });

    const password = watch("password", "");

    const nextStep = async () => {
        const fields: (keyof CreateUserInput)[] =
            step === 1
                ? ["username", "email", "password"]
                : ["firstName", "lastName", "phone", "dateOfBirth", "gender"];
        const isValid = await trigger(fields);
        if (isValid) {
            setStep((prev) => (prev < 3 ? prev + 1 : prev) as Step);
        }
    };

    const prevStep = () => {
        setStep((prev) => (prev > 1 ? prev - 1 : prev) as Step);
    };

    const onSubmit: SubmitHandler<CreateUserInput> = async (data) => {
        setIsLoading(true);
        setError("");
        try {
            await apiSignup(data);
            router.push(`/ auth / validate - email ? email = ${data.email} `);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Registration failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <FormHeader
                        title={"Create an Account"}
                        subtitle={"Join the Pharmacy System today"}
                    />

                    <AppCard
                        bodyTitle={"Sign Up"}
                        bodySubtitle={`Step ${step} of 3`}
                        footerText={"Already have an account?"}
                        footerLinkText={"Sign In"}
                        footerHref="/auth/login"
                    >
                        <AppFormBody handleSubmit={handleSubmit(onSubmit)} error={error}>
                            {step === 1 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                                        <Input
                                            id="username" {...register("username")}
                                            className="bg-input border-border focus:ring-primary"
                                            placeholder="Denial"
                                        />
                                        {errors.username && (
                                            <p className="text-red-500 text-sm">{errors.username.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                                        <Input
                                            id="email"
                                            type="email" {...register("email")}
                                            className="bg-input border-border focus:ring-primary"
                                            placeholder="denial@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...register("password")}
                                                className="bg-input border-border focus:ring-primary"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="my-4">
                                        <PasswordStrengthIndicator password={password} rules={passwordValidationRules} />
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-foreground font-medium">First Name</Label>
                                            <Input
                                                id="firstName"
                                                {...register("firstName")}
                                                placeholder="Denial"
                                            />
                                            {errors.firstName && (
                                                <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-foreground font-medium">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                {...register("lastName")}
                                                placeholder="Asher"
                                            />
                                            {errors.lastName && (
                                                <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-foreground font-medium">Phone</Label>
                                        <Input
                                            id="phone"
                                            {...register("phone")}
                                            placeholder="0123456789"
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm">{errors.phone.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Controller
                                            control={control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                                <AppCalendar
                                                    id="dateOfBirth"
                                                    label="Date of Birth"
                                                    date={field.value ? new Date(field.value) : undefined}
                                                    onDateChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                                    buttonClassName="w-full"
                                                    placeholder="DD/MM/YYYY"
                                                />
                                            )}
                                        />
                                        {errors.dateOfBirth && (
                                            <p className="text-red-500 text-sm">
                                                {errors.dateOfBirth.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-foreground font-medium">Gender</Label>
                                        <Controller
                                            control={control}
                                            name="gender"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-full text-normal">
                                                        <SelectValue placeholder="Select Gender" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card">
                                                        <SelectGroup>
                                                            <SelectItem value="MALE">Male</SelectItem>
                                                            <SelectItem value="FEMALE">Female</SelectItem>
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.gender && (
                                            <p className="text-red-500 text-sm">{errors.gender.message}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-foreground font-medium">Address</Label>
                                        <Input
                                            id="address"
                                            {...register("address")}
                                            placeholder="123 Main Street"
                                        />
                                        {errors.address && (
                                            <p className="text-red-500 text-sm">{errors.address.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-foreground font-medium">City</Label>
                                        <Input
                                            id="city"
                                            {...register("city")}
                                            placeholder="Colombo"
                                        />
                                        {errors.city && (
                                            <p className="text-red-500 text-sm">{errors.city.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state" className="text-foreground font-medium">State</Label>
                                        <Input id="state" {...register("state")} placeholder="Western" />
                                        {errors.state && (
                                            <p className="text-red-500 text-sm">{errors.state.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode" className="text-foreground font-medium">Postal Code</Label>
                                        <Input id="postalCode" {...register("postalCode")} placeholder="10650" />
                                        {errors.postalCode && (
                                            <p className="text-red-500 text-sm">
                                                {errors.postalCode.message}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col space-y-4">
                                {step > 1 && (
                                    <Button type="button" onClick={prevStep}>
                                        Back
                                    </Button>
                                )}
                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep}>
                                        Next
                                    </Button>
                                ) : (
                                    <AppButton
                                        isLoading={isLoading}
                                        loadingText={"Signing up..."}
                                        disabled={!isValid || isLoading}
                                    >
                                        Sign Up
                                    </AppButton>
                                )}
                            </div>
                        </AppFormBody>
                    </AppCard>
                    <FormFooter />
                </motion.div>
            </div>
        </div>
    );
}
