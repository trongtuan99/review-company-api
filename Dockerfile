FROM ruby:3.1.2

ENV RAILS_ENV=development
ENV INSTALL_PATH=/var/www/html/review-company
ENV BUNDLE_PATH=/usr/local/bundle

WORKDIR $INSTALL_PATH

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    nodejs \
    postgresql-client \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Install bundler
RUN gem install bundler:2.4.0

# Copy Gemfile first for layer caching
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install --jobs=4 --retry=3

# Copy application code
COPY . .

# Create required directories
RUN mkdir -p log tmp/pids tmp/cache tmp/sockets

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
