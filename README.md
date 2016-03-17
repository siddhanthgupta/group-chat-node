## NodeJS based Chatroom for a LAN



The main difference as I see it is that Apache is **thread and process based** - i.e **each request is handled by a separate thread or process**, which means while it is processing input/output, the entire thread is blocked. Node JS has **asynchronous, event driven input/output**. Every **nodejs instance runs in a single thread** and due to its asynchronous nature, it can handle a far greater number of concurrent requests as compared to Apache. **Node can do far more than just http web applications though**, which makes it useful in a number of unique situations (ex: nodebots - robots programmed in node).

While you can do a lot of things with node, it is not the best fit for things like static sites, a blog, or ecommerce websites. These sites don't benefit a great deal from node's asynchronous nature and it can end up being overkill. One of the best use-cases for node is for a chat room, a multiplayer real-time game, or multiple users simultaneously editing the same document (a la google docs).

Apache generally uses PHP as a scripting language, which has been around forever, is stable, and has a lot of support. If you're going to use a CMS like Wordpress, Drupal, or Joomla or really anything PHP-related, you're much better off going with Apache. Nginx is similar to apache, but it is supposed to be even faster at serving static files and its gaining in popularity.

These three are not mutually exclusive, however. Many websites have Apache an/or Nginx installed alongside node and use different servers to best serve the type of content requested. In fact, It is rare to find a website that relies solely on node to serve content in the wild.
