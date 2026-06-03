import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }
}
