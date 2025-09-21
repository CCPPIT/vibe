# You can use most Debian-based base images
FROM oven/bun:1.1-slim

# Install curl and other dependencies
RUN apt-get update && apt-get install -y curl git && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Install dependencies and customize sandbox
WORKDIR /home/user

# Create Next.js app with Bun
RUN bunx --yes create-next-app@15.5.3 nextjs-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

WORKDIR /home/user/nextjs-app

# Install shadcn/ui with Bun
RUN bunx --yes shadcn@latest init --yes --defaults
RUN bunx --yes shadcn@latest add --all --yes

# Install dependencies
RUN bun install

# Move everything to home directory and clean up
WORKDIR /home/user
RUN mv nextjs-app/* . && rm -rf nextjs-app

# Set default command
CMD ["bun", "run", "dev"]