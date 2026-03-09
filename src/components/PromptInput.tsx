"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Loader, Send } from "lucide-react";
import { useDiagramStore } from "@/store/diagramStore";

const formSchema = z.object({
  description: z.string().trim().min(1, "Prompt is required."),
});

const PromptInput = () => {
  const { generateFromPrompt, loading } = useDiagramStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
    // mode: "onSubmit",
    // reValidateMode: "onSubmit",
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    generateFromPrompt(data.description);
    form.reset();
  }

  return (
    <Card className="w-78 p-0 absolute left-2 bottom-2 z-10 gap-0 border-0 shadow-none ">
      <CardContent className="px-0">
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-demo-description"
                      placeholder="Create a flowchart."
                      rows={2}
                      className="min-h-8 resize-none"
                      aria-invalid={fieldState.invalid}
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                    />
                  </InputGroup>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-rhf-demo"
            disabled={loading}
            className="rounded-lg absolute -right-13 bottom-1"
          >
            {loading ? (
              <Loader stroke="#ffffff" className="size-full animate-spin" />
            ) : (
              <Send stroke="#ffffff" className="size-full" />
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default PromptInput;
