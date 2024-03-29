// Copyright (C) 2020 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.googlesource.gerrit.plugins.zuul.util;

import com.google.gerrit.entities.Project;
import com.google.gerrit.extensions.common.ChangeInfo;
import com.google.gerrit.extensions.common.CommitInfo;
import com.google.gerrit.server.git.GitRepositoryManager;
import com.google.inject.Inject;
import java.io.IOException;
import org.eclipse.jgit.errors.RepositoryNotFoundException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;

public class CommitMessageFetcher {
  private final GitRepositoryManager repoManager;

  @Inject
  CommitMessageFetcher(GitRepositoryManager repoManager) {
    this.repoManager = repoManager;
  }

  public String fetch(Project.NameKey p, String rev)
      throws RepositoryNotFoundException, IOException {
    try (Repository repo = repoManager.openRepository(p);
        RevWalk rw = new RevWalk(repo)) {
      RevCommit commit = rw.parseCommit(ObjectId.fromString(rev));
      return commit.getFullMessage();
    }
  }

  /**
   * Extracts the commit message of the most current revision of a change.
   *
   * <p>The ChangeInfo must have the {@link CommitInfo} of at least the most current revision
   * loaded.
   *
   * @param changeInfo The ChangeInfo to extract the commit message from
   * @return the extracted commit message
   */
  public String fetch(ChangeInfo changeInfo) {
    String current = changeInfo.currentRevision;
    CommitInfo commitInfo = changeInfo.revisions.get(current).commit;
    return commitInfo.message;
  }
}
