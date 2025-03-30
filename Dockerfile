# Base Ruby image
FROM ruby:3.2

# Install system dependencies
RUN apt-get update -qq && apt-get install -y nodejs yarn postgresql-client build-essential libpq-dev

# Set working directory
WORKDIR /app

# Copy the app files
COPY . .

# Install dependencies
RUN gem install bundler
RUN bundle install
RUN yarn install

# Precompile assets
RUN RAILS_ENV=production SECRET_KEY_BASE=dummy_key bundle exec rake assets:precompile

# Expose port
EXPOSE 8080

# Start server (use port 8080 for Cloud Run)
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
