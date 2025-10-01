import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  number: z.string().nonempty(),
  name: z.string().nonempty(),
  group: z.string().nonempty(),
  problemType: z.string().nonempty(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export interface CustomerFormProps {
  defaultValues?: Partial<FormSchemaType>;
  onSubmit: (data: FormSchemaType) => void;
  children: React.ReactNode;
}

export const CustomerForm = ({
  defaultValues,
  onSubmit,
  children,
}: CustomerFormProps) => {
  const form = useForm<FormSchemaType>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: "",
      name: "",
      group: "",
      problemType: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="problemType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem Type</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  );
};
