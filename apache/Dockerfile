FROM httpd:2.4

# Enable required modules (commented out by default in httpd.conf)
RUN sed -i \
        -e 's/^#\(LoadModule proxy_module\)/\1/' \
        -e 's/^#\(LoadModule proxy_http_module\)/\1/' \
        -e 's/^#\(LoadModule proxy_wstunnel_module\)/\1/' \
        -e 's/^#\(LoadModule rewrite_module\)/\1/' \
        -e 's/^#\(LoadModule deflate_module\)/\1/' \
        -e 's/^#\(LoadModule headers_module\)/\1/' \
        -e 's/^#\(LoadModule ssl_module\)/\1/' \
        -e 's/^#\(LoadModule socache_shmcb_module\)/\1/' \
    /usr/local/apache2/conf/httpd.conf

# Add SSL session cache, Listen 443 and include our site configs
RUN echo '' >> /usr/local/apache2/conf/httpd.conf \
    && echo 'Listen 443' >> /usr/local/apache2/conf/httpd.conf \
    && echo 'SSLSessionCache shmcb:/usr/local/apache2/logs/ssl_gcache_data(512000)' >> /usr/local/apache2/conf/httpd.conf \
    && echo 'SSLSessionCacheTimeout 300' >> /usr/local/apache2/conf/httpd.conf \
    && echo 'IncludeOptional conf/sites/*.conf' >> /usr/local/apache2/conf/httpd.conf

# Create required directories
RUN mkdir -p /usr/local/apache2/conf/sites /var/www/certbot

COPY english.conf /usr/local/apache2/conf/sites/english.conf

EXPOSE 80 443
