<script setup>
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm, useField } from "vee-validate"
import { z } from "zod"
import { toTypedSchema } from "@vee-validate/zod"
import { ref } from "vue"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-vue-next"

const successMessage = ref("")
const errorMessage = ref("")


// Zod schema
const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  section: z.string().min(1, "Section is required"),
})

// Initialize form with Zod validation
const { handleSubmit, errors, values } = useForm({
  validationSchema: toTypedSchema(studentSchema)
})

// Bind each field
const { value: file } = useField("file")

function handleFileUpload(event) {
  file.value = event.target.files[0]
}

// Submit function
const submitForm = handleSubmit(async (values) => {
  successMessage.value = ""
  errorMessage.value = ""

  try {
    const res = await fetch("http://localhost:3000/api/studentForm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })

    if (res.ok) {
      successMessage.value = "Student registered successfully!"
    } else {
      const data = await res.json()
      errorMessage.value = data.message || "Something went wrong. Please try again."
    }
  } catch (err) {
    errorMessage.value = "Server error. Please try again later."
  }
})

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md border border-border rounded-xl p-6 shadow-md bg-card">
      <router-link to="/" class="text-sm text-muted-foreground hover:underline">Back</router-link>
      <h2 class="text-xl font-semibold text-center mb-6">Student Form</h2>

        <!-- Success Alert -->
        <Alert v-if="successMessage" class="mb-4 border-green-500 text-green-700 bg-green-50 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <CheckCircle2 class="h-5 w-5 text-green-600" />
            <div>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{{ successMessage }}</AlertDescription>
            </div>
        </div>
        <router-link 
            to="/students" 
            class="text-sm font-medium text-muted-foreground hover:underline">
            View All
        </router-link>
        </Alert>

        <!-- Error Alert -->
        <Alert v-if="errorMessage" class="mb-4 border-red-500 text-red-700 bg-red-50">
        <XCircle class="h-5 w-5 text-red-600" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

      <form @submit.prevent="submitForm" class="flex flex-col gap-4">
        <FormField name="studentId" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Student ID</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Student ID" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="firstName" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="First Name" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="lastName" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Last Name" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="section" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Section</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Section" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="mt-4 w-full">Submit</Button>
      </form>
    </div>
  </div>
</template>