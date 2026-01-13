<template>
  <!--------------------------------Hero Card--------------------------------->
  <div class="flex justify-center items-center h-svh pb-50">
    <Card class="w-xs">
      <CardContent>
        <h1 class="text-md font-bold">Caphne</h1>
        <p class="text-md font-extralight">Find your perfect studymate</p>
        <div class="text-xl leading-relaxed">
          <p class="mt-8">Connect with students</p>
          <p>who understand you.</p>
          <p>Find your perfect</p>
          <p>study buddy today.</p>
        </div>
        <Button class="mt-8 h-8" variant="default">
          <Icon name="ci:google" size="20" />
          Continue with Google
        </Button>
        <Button class="mt-2 h-8" variant="default">
          <Icon name="ci:github" size="20" />
          Continue with Github
        </Button>
      </CardContent>
    </Card>
  </div>
  <!--------------------------------Hero Card--------------------------------->
  <div class="flex justify-center items-center gap-10">
    <div class="w-md">
      <h1 class="text-4xl font-medium leading-snug">
        We connect friends with similar goals, motion and drive.
      </h1>
      <p class="text-md pt-6">
        We want the friends you meet to feel intentional.
        We want to connect like-minded people to grow together.
      </p>
      <Button class="mt-4">Connect today</Button>
    </div>
    <img class="h-96 rounded-2xl" src="/placeholder-1.png">
  </div>
  <!--------------------------------Date & BFF--------------------------------->
  <div class="grid grid-cols-2 gap-5 mt-80">
    <div>
      <Card class="min-w">
        <CardContent>
          <img src="/placeholder-3.png" class="w-full h-72 object-cover rounded-xl" />
          <h1 class="text-3xl pt-6">Find your Studydate</h1>
          <p class="pt-6">
            Whether you need help with homework or you're ready to help somebody with their homework,
            Caphne helps you connect with friends as motivated as you are over work and study.
          </p>
          <div class="flex gap-2 mt-6">
            <Button class="mt-2 h-10 hover:px-6" variant="default">
              <Icon name="ci:google" size="20" />
              Chat work & studies
            </Button>
            <Button class="mt-2 h-10 hover:px-6" variant="default">
              <Icon name="ri:graduation-cap-fill" size="20" />
              Chill over Matcha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    <div>
      <Card class="size-2xl">
        <CardContent>
          <img src="/placeholder-2.png" class="w-full h-72 object-cover rounded-xl" />
          <h1 class="text-3xl pt-6">
            Find your BFF <span class="text-sm">(Builder Friend Forever)</span>
          </h1>
          <p class="pt-6">
            You just moved to HCM City and is looking to connect with friends or expand your circle?
            Caphne BFF helps you find driven and like-minded builders to make stuff happen.
          </p>
          <div class="flex gap-2 mt-6">
            <Button class="mt-2 h-10 hover:px-6" variant="default">
              <Icon name="ci:github" size="20" />
              Geek over Code
            </Button>
            <Button class="mt-2 h-10 hover:px-6" variant="default">
              <Icon name="famicons:football-sharp" size="20" />
              Football Friday
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  <!--------------------------------Success stories--------------------------------->
  <div class="flex pt-80 justify-center gap-10">
    <img src="/placeholder-4.png" class="h-80 w-80 object-cover rounded-2xl">
    <div>
      <h1 class="text-4xl font-medium leading-snug">
        Start the chat over interests. <br>
        Bond over inspirations. <br>
        Continue in person.
      </h1>
      <div class="flex gap-2">
        <Button class="mt-2 h-10 hover:px-6" variant="default">
          <Icon name="ri:graduation-cap-fill" size="20" />
          Dominating Econ Statistics
        </Button>
        <Button class="mt-2 h-10 hover:px-6" variant="default">
          <Icon name="bx:bxs-coffee-alt" size="20" />
          Highlands Matcha sucks
        </Button>
      </div>
      <div class="flex gap-2">
        <Button class="mt-2 h-10 hover:px-6" variant="default">
          <Icon name="material-symbols:format-list-bulleted-rounded" size="20" />
          Death by IELTS
        </Button>
        <Button class="mt-2 h-10 hover:px-6" variant="default">
          <Icon name="famicons:football-sharp" size="20" />
          Football on Friday
        </Button>
      </div>
      <div class="flex gap-2">
        <Button class="mt-2 h-10 hover:px-6" variant="default">
          <Icon name="mdi:github" size="20" />
          Needs debugging
        </Button>
      </div>
    </div>
  </div>
</template>
