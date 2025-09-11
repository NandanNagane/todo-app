import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import bgSvg from "../../assets/Register.svg";
import womanSvg from "../../assets/woman.svg";

import FacebookIcon from "../../assets/facebook.svg?react";
import GoogleIcon from "../../assets/google.svg?react";
import TwitterIcon from "../../assets/twitter.svg?react";


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Link, useNavigation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandler";


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function LoginForm() {


  console.log(import.meta.env.VITE_SERVER_URL);
  

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    console.log(values);
    
    setIsLoading(true); // Set loading to true at the start
    try {
      const res = await axiosInstance.post(`/auth/login`, values);

      if (res.data.success) {
        toast.success("Login successful");
        navigate(`/app/today`);
      }
    } catch (err) {
      handleApiError(err, form);
    } finally {
      // This block will run whether the login succeeds or fails
      setIsLoading(false); // Always reset loading to false at the end
    }
  }

  return (
    <>
      <div
        className="min-h-screen w-full overflow-x-hidden overflow-y-auto flex justify-around items-center    "
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundImage: `url(${bgSvg})`,
         
        }}
      >

        <div className="p-5">
          <h1 className="scroll-m-20  text-4xl font-bold tracking-tight text-balance">
            Log in
          </h1>

          <div className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-4 md:w-[40vw] w-[70vw]  border-4  rounded-2xl"
              >
                <FormField
                  control={form.control}
                  disabled={isLoading}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className={"text-lg"}>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  disabled={isLoading}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className={"text-lg"}>Password</FormLabel>
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

                <Button
                  type="submit"
                  className="mt-4 cursor-pointer "
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2Icon className="animate-spin mr-2" />
                      Please wait
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div>
            <div className="mt-4 flex items-center space-x-5 mb-3">
              <p>Or, Login with</p>
              <div className="flex justify-center items-center gap-4 mt-2">
                {/* Use the icons directly as components */}
                <a
                  href={`${import.meta.env.VITE_SERVER_URL}/auth/google`}
                  title="Login with Google"
                >
                  <GoogleIcon />
                </a>
       
                <a
                  href={`${import.meta.env.VITE_SERVER_URL}/auth/twitter`}
                  title="Login with Twitter"
                >
                  <TwitterIcon />
                </a>
              </div>
            </div>

            <p>
              Don't have an account? {"  "}
              <Link
                to="/auth/register"
                className="text-blue-500 hover:underline"
              >
                Create one{" "}
              </Link>
            </p>
          </div>
        </div>

        <div className=" h-screen hidden md:flex justify-center items-center">
          <div
            className="size-[50vw] "
            style={{
              backgroundImage: `url(${womanSvg})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
           
            }}
          ></div>
        </div>
      </div>
    </>
  );
}
