import React from 'react';
import ReactDOM from 'react-dom';

const myfirstelement =     <div>
     <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container">
      <span style="text-decoration:bold;color:white;">ParadoxBJJ.com</span>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarResponsive">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">Home
              <span class="sr-only">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/articles">Articles</a>
          </li>
    <li class="nav-item">
            <a class="nav-link" href="https://paradoxbjj.freeforums.net/">Forums</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/contact">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  </div>

ReactDOM.render(myfirstelement, document.getElementById('navbar_container'));
