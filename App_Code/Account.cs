using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
///Role 的摘要说明
/// </summary>
public class Account
{
    public int account_idx { get; set; }
    public string account_name { get; set; }
    public string account_type { get; set; }
    public string account_link_idx { get; set; }
    public string role_type { get; set; }
    public List<Ability> abilityItems = new List<Ability>();
    public int messageCount { get; set; }
    public List<Message> messageItems = new List<Message>();
    public bool checkAbility(string abilityCode)
    {
        foreach (Ability ab in abilityItems)
        {
            if (ab.ability_code.Equals(abilityCode)) return true;
        }
        return false;
    }
}

public class Ability
{
    public string ability_code { get; set; }
    public string ability_name { get; set; }
    public string ability_title { get; set; }
    public string icon { get; set; }
}

public class Message
{
    public int message_idx { get; set; }
    public string message_type { get; set; }
    public string message_state { get; set; }
    public int source_account_idx { get; set; }
    public int receive_account_idx { get; set; }
    public int subject_idx { get; set; }
    public int link_idx { get; set; }
    public string message_title { get; set; }
    public string message_content { get; set; }
    public string message_time { get; set; }
}