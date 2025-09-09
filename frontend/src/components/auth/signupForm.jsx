import { Link, redirect } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { url, z } from "zod";
import { Button } from "@/components/ui/button";
import bgSvg from "../../assets/Register.svg";
import manSvg from "../../assets/R 2.svg";
import { useNavigate } from "react-router-dom";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";

export const signupSchema = z
  .strictObject({
    userName: z
      .string()
      .min(5, { message: "Username must be at least 5 characters." }),

    email: z.string().email({ message: "Invalid email address." }),

    password: z
      .string()
      .min(8, { message: "Must be 8+ characters long" })
      .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
      .regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
      .regex(/[0-9]/, { message: "Must contain a number" })
      .regex(/[^a-zA-Z0-9]/, { message: "Must contain a special character" }),

    confirmPassword: z.string(),
    agree: z.literal(true, {
      message: "You must agree to all terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords does not match",
    path: ["confirmPassword"],
  });

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values) {
    try {
      setIsLoading(true);
      await axiosInstance.post(`/auth/signup`, values);
      toast.info("Account Created.Please signup.", {
        id: "signup-success-toast",
      });
      navigate("/auth/login");
    } catch (err) {
      if (err.response?.data?.errors) {
        

        const fieldErrors = err.response.data.errors;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          form.setError(field, {
            type: "server",
            message: messages[0], // use the first message for that field
          });
        });
        setIsLoading(false);
      } else {
        console.error("Unexpected signup error:", err);
        setIsLoading(false);
      }
    }
  }

  return (
    <div
      className="min-h-screen overflow-auto flex justify-around items-center   "
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: `url(${bgSvg})`,
      }}
    >
      <div
        className="  items-center h-screen justify-self-start justify-center hidden md:flex"
        style={{
          backgroundImage: `url(${manSvg})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minWidth: "350px",
        }}
      ></div>

      <div className="p-5">
        <h1 className="scroll-m-20  text-4xl font-bold tracking-tight text-balance">
          Sign Up
        </h1>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 md:w-[40vw] w-[70vw]  border-4  rounded-2xl"
            >
              <FormField
                control={form.control}
                name="userName"
                disabled={isLoading}
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Username" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="Password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="Password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="agree"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <div className="flex items-center space-x-1.5 ">
                      <FormControl>
                        <input type="checkbox" {...field} />
                      </FormControl>
                      <FormLabel>I agree to all terms and conditions</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-4 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2Icon className="animate-spin mr-2" />
                    Please wait
                  </div>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>
          <p className="mt-3">
            Already have an account ?{"  "}
            <Link to="/auth/login" className="text-blue-500 hover:underline">
              Login{" "}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
