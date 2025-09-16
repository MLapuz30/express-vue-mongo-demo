<script>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default {
  name: "HomePage",
  components: {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">Homepage</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Portal</CardTitle>
          <CardDescription>
            Choose your access level to continue
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Button as-child class="w-full">
            <router-link to="/studentForm">
              Student Form
            </router-link>
          </Button>
          <Button as-child variant="outline" class="w-full">
            <router-link to="/adminForm">
              Admin Form
            </router-link>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>