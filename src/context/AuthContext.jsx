import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient.js";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  // Sign up
  const signUpNewUser = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { display_name: name }, // saved as user_metadata.username
      },
    });

    if (error) {
      console.error("Issue occured, try again later:", error);
      return { success: false, error };
    }
    return { success: true, data };
  };

  // Sign in
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.error("Sign in error occured, try again later:", error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (error) {
      console.error("Issue occured, try again later:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Stop listening when the provider unmounts
    return () => subscription.unsubscribe();
  }, []);

    // Save PC specs
    const savePcSpecs = async (specs) => {
    const { data, error } = await supabase.auth.updateUser({
        data: { pc_specs: specs },
    });

    if (error) {
        console.error("Could not save PC specs:", error);
        return { success: false, error };
    }
    return { success: true, data };
    };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Issue occured, try again later:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, signUpNewUser, signOut, signInUser, savePcSpecs }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
