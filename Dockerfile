FROM ruby:3.1.2

ENV RAILS_ENV production
ENV INSTALL_PATH /var/www/html/review-company

# Run rails with puma
CMD rails s
EXPOSE 3000
WORKDIR $INSTALL_PATH


RUN apt-get update -qq && \
    apt-get install -y build-essential software-properties-common libpq-dev nodejs telnet vim && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    echo "deb [arch=amd64] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" >> /etc/apt/sources.list.d/pgdg.list && \
    apt-get update -qq && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY Gemfile .
COPY Gemfile.lock .
RUN gem install bundler:2.2.4
RUN bundle config set without 'development'
RUN bundle install --jobs=3 --retry=3 && mkdir -p log
COPY . .
