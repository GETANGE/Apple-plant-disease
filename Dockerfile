FROM node:20-alpine AS builder

# Define environment variables
ENV NODE_ENV=development  \
    PORT=3000  \
    REDIS_PORT=13393          \ 
    REDIS_PASSWORD=pkajlxlgCUq9WypiNGVmbDTRalEBAGPG  \
    REDIS_HOST=redis-13393.c274.us-east-1-3.ec2.cloud.redislabs.com  \
    UPSTASH_REDIS_REST_URL=https://usw1-electric-herring-34601.upstash.io  \
    UPSTASH_REDIS_REST_TOKEN=AYcpASQgZTI2MzhjMTEtYjBkMy00MTlhLWJkOTctNGRlNWQ4NmZhMGQyNGM3OTgxZWM2MjBlNDc0MmJhMmFlMzdlYWFlMDY2YTY=  \
    JWT_SECRET=my-very-strong-and-unique-secret  \
    JWT_EXPIRES_IN=90d  \
    MAILTRAP_USER=8aadf892ef4b6d  \
    MAILTRAP_PASS=12b53e4315576d  \
    RESEND_API_KEY=re_DwpByoH6_BQUjmYhPUGJfqGshTf3nmnsJ \
    GMAIL_USER=emmanuelgetange48@gmail.com \
    GMAIL_PASS=innczeugrmbkvneu  

# Install pnpm globally (optional)
RUN npm install -g pnpm  

WORKDIR /app

# Copy project files
COPY package*.json ./  
COPY . .  

RUN pnpm install  

# Create a slimmer production image
FROM node:20-alpine AS runner

# Copy only necessary files
COPY --from=builder /app /app

# Expose the application port
EXPOSE 3000

# Start the application using pnpm
CMD ["pnpm", "start"]
